import visaAsset from "@/assets/visa.jpg.asset.json";
import mastercardAsset from "@/assets/mastercard.jpg.asset.json";
import rupayAsset from "@/assets/rupay.png.asset.json";
import amexAsset from "@/assets/amex.webp.asset.json";
import upiAsset from "@/assets/upi.png.asset.json";

/** Official brand marks for the simulated payment step. */

type LogoProps = { className?: string };

const mark = (src: string, alt: string) =>
  function BrandMark({ className }: LogoProps) {
    return <img src={src} alt={alt} loading="lazy" className={className} />;
  };

export const VisaLogo = mark(visaAsset.url, "Visa");
export const MastercardLogo = mark(mastercardAsset.url, "Mastercard");
export const RupayLogo = mark(rupayAsset.url, "RuPay");
export const AmexLogo = mark(amexAsset.url, "American Express");
export const UpiLogo = mark(upiAsset.url, "UPI");

export type PaymentMethod = {
  id: string;
  label: string;
  detail: string;
  Logo: (props: LogoProps) => React.ReactElement;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "visa", label: "Visa", detail: "Card ending 4821", Logo: VisaLogo },
  { id: "mastercard", label: "Mastercard", detail: "Card ending 7702", Logo: MastercardLogo },
  { id: "rupay", label: "RuPay", detail: "Card ending 3195", Logo: RupayLogo },
  { id: "amex", label: "American Express", detail: "Card ending 1008", Logo: AmexLogo },
  { id: "upi", label: "UPI", detail: "rahul@okaxis", Logo: UpiLogo },
];
