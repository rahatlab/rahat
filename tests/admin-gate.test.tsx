/**
 * AdminGate Tests
 * Auth gating: public auth pages stay bare, protected pages get the shell,
 * and signed-in users are bounced from login pages to the dashboard.
 */

import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { AdminGate } from "@/components/admin/admin-gate";

const mockPathname = { current: "/admin" };
const mockReplace = jest.fn();
const mockPush = jest.fn();
const mockGetSession = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => mockPathname.current,
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

jest.mock("better-auth/client", () => ({
  createAuthClient: () => ({
    getSession: () => mockGetSession(),
  }),
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));

jest.mock("@/components/admin/admin-shell", () => ({
  AdminShell: ({ children }: { children: ReactNode }) =>
    require("react").createElement("div", { "data-testid": "admin-shell" }, children),
}));

const page = <div data-testid="page">Page content</div>;

describe("AdminGate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.current = "/admin";
    mockGetSession.mockResolvedValue({ data: { session: { id: "s1" } } });
  });

  it("renders public auth pages bare — no admin shell/sidebar", async () => {
    mockPathname.current = "/admin/login";
    mockGetSession.mockResolvedValue({ data: null }); // signed out
    render(<AdminGate>{page}</AdminGate>);

    expect(screen.getByTestId("page")).toBeInTheDocument();
    expect(screen.queryByTestId("admin-shell")).not.toBeInTheDocument();
    await waitFor(() => expect(mockGetSession).toHaveBeenCalled());
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("sends already-signed-in users from a public page to the dashboard", async () => {
    mockPathname.current = "/admin/login";
    mockGetSession.mockResolvedValue({ data: { session: { id: "s1" } } });
    render(<AdminGate>{page}</AdminGate>);

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/admin"));
    // Still renders the page while the redirect is in flight.
    expect(screen.getByTestId("page")).toBeInTheDocument();
  });

  it("keeps forgot-password accessible while signed out", async () => {
    mockPathname.current = "/admin/forgot-password";
    mockGetSession.mockResolvedValue({ data: null });
    render(<AdminGate>{page}</AdminGate>);

    await waitFor(() => expect(mockGetSession).toHaveBeenCalled());
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByTestId("page")).toBeInTheDocument();
    expect(screen.queryByTestId("admin-shell")).not.toBeInTheDocument();
  });

  it("wraps protected pages in the admin shell when signed in", async () => {
    mockPathname.current = "/admin/projects";
    mockGetSession.mockResolvedValue({ data: { session: { id: "s1" } } });
    render(<AdminGate>{page}</AdminGate>);

    await waitFor(() => expect(screen.getByTestId("admin-shell")).toBeInTheDocument());
    expect(screen.getByTestId("page")).toBeInTheDocument();
  });

  it("blocks protected pages and redirects to login when signed out", async () => {
    mockPathname.current = "/admin/projects";
    mockGetSession.mockResolvedValue({ data: null });
    render(<AdminGate>{page}</AdminGate>);

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/admin/login"));
    expect(screen.queryByTestId("admin-shell")).not.toBeInTheDocument();
    expect(screen.queryByTestId("page")).not.toBeInTheDocument();
  });
});
