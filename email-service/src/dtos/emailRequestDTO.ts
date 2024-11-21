export interface EmailRequestDTO {
  to: string; // Recipient's email address
  subject: string; // Subject of the email
  templateType: string; // Type of template ('verification', 'passwordReset', etc.)
  placeholders: Record<string, string>; // Dynamic data for the template
}
