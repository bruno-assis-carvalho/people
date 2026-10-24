import { RouterProvider } from "react-router"
import { PeopleProvider } from "@/features/people/PeopleProvider"
import { router } from "./routes"

export default function App() {
  return (
    <PeopleProvider>
      <RouterProvider router={router} />
    </PeopleProvider>
  )
}
