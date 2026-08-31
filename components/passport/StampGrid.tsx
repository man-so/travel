import { CountryStamp } from '@/components/passport/CountryStamp';
import type { PassportCountry } from '@/types/passport';

export function StampGrid({
  countries,
  onOpenCountry,
}: {
  countries: PassportCountry[];
  onOpenCountry: (country: PassportCountry) => void;
}) {
  return (
    <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
      {countries.map((country) => (
        <CountryStamp
          country={country}
          key={country.country}
          onOpenMap={() => onOpenCountry(country)}
        />
      ))}
    </section>
  );
}
