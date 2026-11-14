/**
 * Forgot Password Tests
 * Tests the reset-request flow and its confirmation dialog
 */

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import ForgotPasswordPage from "@/app/admin/forgot-password/page";

const mockRequestPasswordReset = jest.fn();

jest.mock("better-auth/client", () => ({
  createAuthClient: () => ({
    requestPasswordReset: (args: unknown) => mockRequestPasswordReset(args),
  }),
}));

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe("Forgot Password Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestPasswordReset.mockResolvedValue({ error: null });
  });

  it("renders the reset request form without a dialog", () => {
    render(<ForgotPasswordPage />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the confirmation dialog after a successful request", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText("Email"), "contract.rahat@gmail.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("Reset email sent")).toBeInTheDocument();
    expect(within(dialog).getByText(/contract\.rahat@gmail\.com/)).toBeInTheDocument();
    expect(within(dialog).getByText(/expires in 1 hour/i)).toBeInTheDocument();
    expect(mockRequestPasswordReset).toHaveBeenCalledWith({
      email: "contract.rahat@gmail.com",
    });
    expect(toast.success).toHaveBeenCalledWith("Check your inbox for the reset link");
  });

  it("closes the dialog with the Close button, leaving the inbox panel", async () => {
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText("Email"), "contract.rahat@gmail.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    const dialog = await screen.findByRole("dialog");
    // Exact accessible name "Close" — the X icon button is named "Close dialog".
    await user.click(within(dialog).getByRole("button", { name: "Close" }));

    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(screen.getByText("Check your inbox")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to sign in/i })).toBeInTheDocument();
  });

  it("keeps the form and shows an error toast when the request fails", async () => {
    mockRequestPasswordReset.mockResolvedValue({ error: { message: "Network error" } });
    const user = userEvent.setup();
    render(<ForgotPasswordPage />);

    await user.type(screen.getByLabelText("Email"), "someone@example.com");
    await user.click(screen.getByRole("button", { name: /send reset link/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Network error"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
  });
});
