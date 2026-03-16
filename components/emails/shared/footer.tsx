import { Hr, Link, Section, Text } from "@react-email/components";

export const Footer = ({
  withAddress = false,
  marketing = false,
  footerText = "If you have any feedback or questions about this email, simply reply to it. I'd love to hear from you!",
}: {
  withAddress?: boolean;
  marketing?: boolean;
  footerText?: string | React.ReactNode;
}) => {
  if (marketing) {
    return (
      <>
        <Hr className="mx-0 my-6 w-full border border-neutral-200" />
        <Text className="text-[12px] leading-6 text-neutral-500">
          We send out product update emails once a month – no spam, no nonsense.
          Don&apos;t want to get these emails?{" "}
          <Link
            className="text-neutral-700 underline"
            href="https://room.nobridge.co/account/general"
          >
            Unsubscribe here.
          </Link>
        </Text>
        <Text className="text-[12px] text-neutral-500">
          Nobridge (VAV Technologies)
          <br />
          Southeast Asia
        </Text>
      </>
    );
  }

  return (
    <>
      <Hr />
      <Section className="text-gray-400">
        <Text className="text-xs">
          © {new Date().getFullYear()} Nobridge (VAV Technologies). All rights reserved.{" "}
        </Text>
        <Text className="text-xs">{footerText}</Text>
      </Section>
    </>
  );
};
