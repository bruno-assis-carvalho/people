import { act, cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { CardGrid } from "./index"

let activeObserver: MockIntersectionObserver | undefined

class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = ""
  readonly thresholds: number[] = []
  readonly observe = vi.fn()
  readonly unobserve = vi.fn()
  readonly disconnect = vi.fn()

  constructor(private readonly callback: IntersectionObserverCallback) {
    activeObserver = this
  }

  takeRecords(): IntersectionObserverEntry[] {
    return []
  }

  intersect() {
    this.callback([{ isIntersecting: true } as IntersectionObserverEntry], this)
  }
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  activeObserver = undefined
})

describe("CardGrid", () => {
  it("loads more when its control intersects and disconnects on unmount", () => {
    vi.stubGlobal("IntersectionObserver", MockIntersectionObserver)
    const onLoadMore = vi.fn()
    const { unmount } = render(
      <CardGrid label="Records" hasMore onLoadMore={onLoadMore}>
        <article>First record</article>
      </CardGrid>,
    )

    expect(screen.getByText("First record")).toBeTruthy()
    expect(activeObserver?.observe).toHaveBeenCalledWith(
      screen.getByRole("button", { name: "Load more" }),
    )

    act(() => activeObserver?.intersect())

    expect(onLoadMore).toHaveBeenCalledOnce()

    const observer = activeObserver
    unmount()
    expect(observer?.disconnect).toHaveBeenCalledOnce()
  })

  it("provides an accessible button for manually loading more", () => {
    const onLoadMore = vi.fn()
    render(
      <CardGrid
        label="Records"
        hasMore
        onLoadMore={onLoadMore}
        loadMoreLabel="Load next page"
      >
        <article>First record</article>
      </CardGrid>,
    )

    fireEvent.click(screen.getByRole("button", { name: "Load next page" }))

    expect(onLoadMore).toHaveBeenCalledOnce()
  })

  it("does not render a load-more control when there are no more items", () => {
    render(
      <CardGrid label="Records">
        <article>Last record</article>
      </CardGrid>,
    )

    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull()
  })
})
