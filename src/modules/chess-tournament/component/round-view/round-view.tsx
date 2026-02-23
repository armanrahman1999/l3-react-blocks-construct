import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { MatchCard } from '@/modules/chess-tournament/component/match-card/match-card';
import { useChessTournamentStore } from '@/modules/chess-tournament/state/tournament-store';

interface Props {
  roundNumber: number;
}

export const RoundView = ({ roundNumber }: Props) => {
  const { t } = useTranslation();
  const matches = useChessTournamentStore((s) => s.getMatchesByRound(roundNumber));

  const hasMatches = matches.length > 0;

  const title = useMemo(() => {
    const roundsCount = useChessTournamentStore.getState().roundsCount ?? 0;
    if (roundNumber === roundsCount && roundsCount > 0) return t('FINALS');
    return t('ROUND_N', { round: roundNumber });
  }, [roundNumber, t]);

  return (
    <div className="grid gap-3">
      <div className="text-lg font-semibold">{title}</div>
      {!hasMatches ? <div className="text-sm text-muted-foreground">{t('NO_MATCHES')}</div> : null}
      {matches.map((m) => (
        <MatchCard key={m.id} match={m} />
      ))}
    </div>
  );
};
