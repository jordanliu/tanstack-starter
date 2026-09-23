import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Link,
  Text,
} from "react-email";

export function ResetPasswordEmail({
  name,
  resetUrl,
}: {
  name: string;
  resetUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>{name ? `Hi ${name},` : "Hi there,"}</Text>
          <Text style={paragraph}>
            We received a request to reset your password. Use the button below
            to choose a new one.
          </Text>
          <Button href={resetUrl} style={button}>
            Reset Password
          </Button>
          <Text style={paragraph}>
            Or copy and paste this link into your browser:
          </Text>
          <Link href={resetUrl} style={link}>
            {resetUrl}
          </Link>
          <Hr style={hr} />
          <Text style={footer}>
            If you didn&apos;t request a password reset, you can safely ignore
            this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "400",
  color: "#484848",
  padding: "17px 0 0",
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
};

const button = {
  backgroundColor: "#007ee6",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "210px",
  padding: "14px 7px",
  margin: "16px auto",
};

const link = {
  color: "#007ee6",
  fontSize: "14px",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  marginTop: "12px",
};

export default ResetPasswordEmail;
