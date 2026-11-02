import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"
import { Skeleton, Spinner } from "./atoms"
import { LoadingState } from "./organisms"

afterEach(cleanup)

describe("loading UI", () => {
  it("renders a decorative spinner with an accessible status label", () => {
    render(<LoadingState label="Checking your sign-in…" />)

    expect(screen.getByRole("status").textContent).toContain(
      "Checking your sign-in…",
    )
    expect(document.querySelector('[aria-hidden="true"]')).toBeTruthy()
  })

  it("renders an accessible skeleton loading state", () => {
    render(<LoadingState label="Loading content" variant="skeleton" />)

    expect(screen.getByRole("status").textContent).toContain("Loading content")
    expect(document.querySelectorAll("[data-variant]")).toHaveLength(4)
  })

  it("exposes standalone skeleton and spinner primitives as decorative", () => {
    const { container } = render(
      <>
        <Skeleton variant="circle" />
        <Spinner />
      </>,
    )

    expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(2)
  })
})
