import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui-kit/tabs';

interface Props {
  rounds: number[];
  selectedRound: number;
  onSelectRound: (round: number) => void;
}

export const RoundSelector = ({ rounds, selectedRound, onSelectRound }: Props) => {
  const { t } = useTranslation();

  const labelFor = (r: number) => {
    if (r === rounds.length) return t('FINALS');
    return t('ROUND_N', { round: r });
  };

  return (
    <Tabs value={String(selectedRound)} onValueChange={(v) => onSelectRound(Number(v))}>
      <TabsList className="flex flex-wrap">
        {rounds.map((r) => (
          <TabsTrigger key={r} value={String(r)}>
            {labelFor(r)}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
