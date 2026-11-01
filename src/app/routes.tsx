import { Navigate, createBrowserRouter } from "react-router"
import Layout from "./Layout"
import { Auth0ProviderRoute, RequireAuth } from "./auth"
import LandingPage from "@/features/account/LandingPage"
import PeopleListPage from "@/features/people/PeopleListPage"
import PersonDetailPage from "@/features/people/PersonDetailPage"
import PersonFormPage from "@/features/people/PersonFormPage"
import {
  PeopleListHeaderAction,
  PersonDetailHeaderAction,
} from "@/features/people/PeoplePageActions"
import ProfilePage from "@/features/account/ProfilePage"
import SignedOutPage from "@/features/account/SignedOutPage"
import SkinEditorPage from "@/features/skin-editor/SkinEditorPage"

export const router = createBrowserRouter([
  {
    element: <Auth0ProviderRoute />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/in",
        element: (
          <RequireAuth>
            <Layout />
          </RequireAuth>
        ),
        handle: { breadcrumb: "Home" },
        children: [
          {
            index: true,
            element: <Navigate to="people" replace />,
          },
          {
            path: "people",
            handle: { breadcrumb: "People" },
            children: [
              {
                index: true,
                element: <PeopleListPage />,
                handle: {
                  title: ({ peopleCount }: { peopleCount: number }) =>
                    `Pessoas cadastradas (${peopleCount})`,
                  headerAction: <PeopleListHeaderAction />,
                },
              },
              {
                path: ":id",
                element: <PersonDetailPage />,
                handle: {
                  breadcrumb: "Person",
                  backTo: "/in/people",
                  title: ({
                    params,
                    getPerson,
                  }: {
                    params: Record<string, string | undefined>
                    getPerson: (id: string) => { name: string } | undefined
                  }) => getPerson(params.id ?? "")?.name ?? "",
                  headerAction: <PersonDetailHeaderAction />,
                },
              },
              {
                path: "create",
                element: <PersonFormPage />,
                handle: {
                  breadcrumb: "Create person",
                  backTo: "/in/people",
                  title: "Adicionar pessoa",
                },
              },
              {
                path: ":id/edit",
                element: <PersonFormPage />,
                handle: {
                  breadcrumb: "Edit person",
                  backTo: "/in/people",
                  title: ({
                    params,
                    getPerson,
                  }: {
                    params: Record<string, string | undefined>
                    getPerson: (id: string) => { name: string } | undefined
                  }) => (getPerson(params.id ?? "") ? "Editar pessoa" : ""),
                },
              },
            ],
          },
          {
            path: "profile",
            element: <ProfilePage />,
            handle: {
              breadcrumb: "Profile",
              backTo: "/in/people",
              title: "Meu perfil",
            },
          },
          {
            path: "skin-editor",
            element: <SkinEditorPage />,
            handle: {
              breadcrumb: "Skin editor",
              backTo: "/in/people",
              title: "Editor de skins",
            },
          },
        ],
      },
      {
        path: "/logout",
        element: <SignedOutPage />,
      },
      {
        path: "*",
        element: <Navigate to="/in/people" replace />,
      },
    ],
  },
])
