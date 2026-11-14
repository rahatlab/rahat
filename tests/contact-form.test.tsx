/**
 * Contact Form Tests
 * Tests the contact form validation and submission
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { ContactSection } from "@/components/site/contact-section";

jest.mock("sonner", () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

const fetchMock = jest.fn();

describe("Contact Form Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.mockResolvedValue({ ok: true });
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it("renders contact form with all required fields", () => {
    render(<ContactSection />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Subject")).toBeInTheDocument();
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it("shows validation errors when the form is submitted empty", async () => {
    render(<ContactSection />);

    // Bypass native constraint validation — the component validates itself.
    fireEvent.submit(document.querySelector("form")!);

    expect(toast.error).toHaveBeenCalledWith("Please fix the highlighted fields.");
    expect(await screen.findByText("Please enter your name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Subject must be at least 3 characters.")).toBeInTheDocument();
    expect(screen.getByText("Message must be at least 10 characters.")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("marks the email field invalid after blurring with a bad value", async () => {
    const user = userEvent.setup();
    render(<ContactSection />);

    const emailInput = screen.getByLabelText("Email");
    await user.type(emailInput, "not-an-email");
    await user.tab();

    expect(emailInput).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
  });

  it("submits valid data to /api/contact", async () => {
    const user = userEvent.setup();
    render(<ContactSection />);

    await user.type(screen.getByLabelText("Name"), "Jane Doe");
    await user.type(screen.getByLabelText("Email"), "jane@company.com");
    await user.type(screen.getByLabelText("Subject"), "Project inquiry");
    await user.type(screen.getByLabelText("Message"), "This is a long enough message for validation.");
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/contact");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body as string)).toMatchObject({
      name: "Jane Doe",
      email: "jane@company.com",
      subject: "Project inquiry",
    });

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Message sent!", expect.anything()),
    );
  });
});
