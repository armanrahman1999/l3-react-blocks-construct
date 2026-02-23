import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui-kit/input';
import { Label } from '@/components/ui-kit/label';
import { useChessTournamentStore } from '@/modules/chess-tournament/state/tournament-store';

export const TournamentHeader = () => {
  const { t } = useTranslation();
  const name = useChessTournamentStore((s) => s.tournamentName);
  const setName = useChessTournamentStore((s) => s.setTournamentName);

  return (
    <div className="grid gap-2">
      <Label htmlFor="tournament-name">{t('TOURNAMENT_NAME')}</Label>
      <Input
        id="tournament-name"
        value={name}
        placeholder={t('TOURNAMENT_NAME_PLACEHOLDER')}
        onChange={(e) => setName(e.target.value)}
      />
    </div>
  );
};
