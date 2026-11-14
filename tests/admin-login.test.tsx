/**
 * Admin Login Component Tests
 * Tests the admin authentication flow
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import AdminLoginPage from "@/app/admin/login/page";

const mockFetch = jest.fn();
const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    refresh: mockRefresh,
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock fetch globally
global.fetch = mockFetch;

describe("Admin Login Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ error: null }),
    });
  });

  it("renders login form with required fields", () => {
    render(<AdminLoginPage />);

    const emailInput = screen.getByLabelText("Email");
    const passwordInput = screen.getByLabelText("Password");
    const submitBtn = screen.getByRole("button", { name: /sign in/i });

    expect(emailInput).toHaveAttribute("type", "email");
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(submitBtn).toBeEnabled();
    expect(screen.getByText("Forgot?")).toBeInTheDocument();
  });

  it("shows error when email is missing", async () => {
    const user = userEvent.setup();
    render(<AdminLoginPage />);

    await user.type(screen.getByLabelText("Password"), "password123");
    fireEvent.submit(document.querySelector("form")!);

    expect(toast.error).toHaveBeenCalledWith("Email and password are required");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("shows error when password is missing", async () => {
    const user = userEvent.setup();
    render(<AdminLoginPage />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    fireEvent.submit(document.querySelector("form")!);

    expect(toast.error).toHaveBeenCalledWith("Email and password are required");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("signs in with valid credentials", async () => {
    const user = userEvent.setup();
    render(<AdminLoginPage />);

    await user.type(screen.getByLabelText("Email"), "contract.rahat@gmail.com");
    await user.type(screen.getByLabelText("Password"), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(mockFetch).toHaveBeenCalledWith(
        "https://rahat-work.vercel.app/api/auth/sign-in/email",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "contract.rahat@gmail.com",
            password: "password123",
          }),
        }
      ),
    );
    expect(toast.success).toHaveBeenCalledWith("Welcome back!");
    // Note: window.location.href is used instead of router.push
    // so mockPush won't be called - we're testing the fetch call instead
  });

  it("shows error when login fails", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ error: { message: "Invalid credentials" } }),
    });

    const user = userEvent.setup();
    render(<AdminLoginPage />);

    await user.type(screen.getByLabelText("Email"), "test@example.com");
    await user.type(screen.getByLabelText("Password"), "wrongpassword");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Invalid credentials"),
    );
    expect(mockFetch).toHaveBeenCalled();
  });
});