import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-kit/card';
import { Button } from '@/components/ui-kit/button';
import { Separator } from '@/components/ui-kit/separator';

import { TournamentHeader } from '@/modules/chess-tournament/component/tournament-header/tournament-header';
import { SeedingSelector } from '@/modules/chess-tournament/component/seeding-selector/seeding-selector';
import { PlayerList } from '@/modules/chess-tournament/component/player-list/player-list';
import { RoundSelector } from '@/modules/chess-tournament/component/round-selector/round-selector';
import { RoundView } from '@/modules/chess-tournament/component/round-view/round-view';
import { ChampionBanner } from '@/modules/chess-tournament/component/champion-banner/champion-banner';

import { useChessTournamentStore } from '@/modules/chess-tournament/state/tournament-store';

export const ChessTournamentPage = () => {
  const { t } = useTranslation();

  const phase = useChessTournamentStore((s) => s.phase);
  const players = useChessTournamentStore((s) => s.players);
  const roundsCount = useChessTournamentStore((s) => s.roundsCount);
  const selectedRound = useChessTournamentStore((s) => s.selectedRound);
  const champion = useChessTournamentStore((s) => s.champion);

  const generate = useChessTournamentStore((s) => s.generateBracket);
  const resetToSetup = useChessTournamentStore((s) => s.resetToSetup);
  const clearAll = useChessTournamentStore((s) => s.clearAll);
  const setSelectedRound = useChessTournamentStore((s) => s.setSelectedRound);

  const canGenerate = players.length >= 2;

  const roundOptions = useMemo(() => {
    const count = roundsCount ?? 0;
    return Array.from({ length: count }, (_, i) => i + 1);
  }, [roundsCount]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <TournamentHeader />

      {champion ? <ChampionBanner championName={champion.name} /> : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>{t('CHESS_TOURNAMENT')}</CardTitle>

          <div className="flex items-center gap-2">
            {phase === 'bracket' ? (
              <Button variant="outline" onClick={resetToSetup}>
                {t('EDIT_PLAYERS')}
              </Button>
            ) : null}

            <Button variant="destructive" onClick={clearAll}>
              {t('CLEAR')}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          {phase === 'setup' ? (
            <>
              <SeedingSelector />
              <Separator />
              <PlayerList />

              <div className="flex items-center justify-end gap-2">
                <Button disabled={!canGenerate} onClick={generate}>
                  {t('GENERATE_BRACKET')}
                </Button>
              </div>

              {!canGenerate ? (
                <div className="text-sm text-muted-foreground">{t('MIN_PLAYERS_VALIDATION')}</div>
              ) : null}
            </>
          ) : (
            <>
              <RoundSelector
                rounds={roundOptions}
                selectedRound={selectedRound}
                onSelectRound={setSelectedRound}
              />
              <RoundView roundNumber={selectedRound} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
