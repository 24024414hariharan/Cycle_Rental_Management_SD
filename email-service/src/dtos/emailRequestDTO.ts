export interface EmailRequestDTO {
  to: string;
  subject: string;
  templateType: string;
  placeholders: Record<string, string>;
}
