import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui-kit/card';
import { Button } from '@/components/ui-kit/button';
import type { Match } from '@/modules/chess-tournament/domain/types';
import { useChessTournamentStore } from '@/modules/chess-tournament/state/tournament-store';
import { cn } from '@/lib/utils';

interface Props {
  match: Match;
}

export const MatchCard = ({ match }: Props) => {
  const { t } = useTranslation();
  const getName = useChessTournamentStore((s) => s.getPlayerNameById);
  const setWinner = useChessTournamentStore((s) => s.setWinner);

  const p1Name = getName(match.player1Id);
  const p2Name = getName(match.player2Id);

  const canPickWinner = Boolean(match.player1Id && match.player2Id);

  const winnerName = useMemo(() => getName(match.winnerId), [getName, match.winnerId]);

  const pick = (playerId?: string) => {
    if (!playerId) return;
    setWinner(match.id, playerId);
  };

  const isBye =
    (Boolean(match.player1Id) && !match.player2Id) ||
    (!match.player1Id && Boolean(match.player2Id));

  return (
    <Card className="flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {t('MATCH_N', { match: match.matchNumber })}
        </div>
        <div className="text-sm">
          {match.status === 'complete' ? (
            <span className="font-medium">
              {t('WINNER')}: {winnerName || t('TBD')}
            </span>
          ) : (
            <span className="text-muted-foreground">{t('PENDING')}</span>
          )}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <div
          className={cn(
            'rounded-md border p-2',
            match.winnerId === match.player1Id ? 'border-primary' : ''
          )}
        >
          <div className="text-sm text-muted-foreground">{t('PLAYER_1')}</div>
          <div className="font-medium">{p1Name || t('TBD')}</div>
          <Button
            className="mt-2 w-full"
            variant={match.winnerId === match.player1Id ? 'default' : 'outline'}
            disabled={!canPickWinner || !match.player1Id}
            onClick={() => pick(match.player1Id)}
          >
            {t('SET_WINNER')}
          </Button>
        </div>

        <div
          className={cn(
            'rounded-md border p-2',
            match.winnerId === match.player2Id ? 'border-primary' : ''
          )}
        >
          <div className="text-sm text-muted-foreground">{t('PLAYER_2')}</div>
          <div className="font-medium">{p2Name || t('TBD')}</div>
          <Button
            className="mt-2 w-full"
            variant={match.winnerId === match.player2Id ? 'default' : 'outline'}
            disabled={!canPickWinner || !match.player2Id}
            onClick={() => pick(match.player2Id)}
          >
            {t('SET_WINNER')}
          </Button>
        </div>
      </div>

      {isBye && match.status === 'complete' ? (
        <div className="text-sm text-muted-foreground">{t('BYE_AUTO_ADVANCE')}</div>
      ) : null}
    </Card>
  );
};
