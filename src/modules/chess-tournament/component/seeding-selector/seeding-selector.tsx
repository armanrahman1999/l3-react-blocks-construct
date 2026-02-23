import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui-kit/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui-kit/select';
import { useChessTournamentStore } from '@/modules/chess-tournament/state/tournament-store';

export const SeedingSelector = () => {
  const { t } = useTranslation();
  const mode = useChessTournamentStore((s) => s.seedingMode);
  const setMode = useChessTournamentStore((s) => s.setSeedingMode);

  return (
    <div className="grid gap-2">
      <Label>{t('SEEDING')}</Label>
      <Select value={mode} onValueChange={(v) => setMode(v as 'random' | 'manual')}>
        <SelectTrigger className="w-full sm:w-[280px]">
          <SelectValue placeholder={t('SELECT_SEEDING')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="random">{t('SEEDING_RANDOM')}</SelectItem>
          <SelectItem value="manual" disabled>
            {t('SEEDING_MANUAL_DISABLED')}
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
