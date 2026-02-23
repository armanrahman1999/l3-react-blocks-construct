import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui-kit/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui-kit/dialog';
import { Textarea } from '@/components/ui-kit/textarea';
import { useChessTournamentStore } from '@/modules/chess-tournament/state/tournament-store';

const parseNames = (raw: string): string[] =>
  raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

export const BulkPasteDialog = () => {
  const { t } = useTranslation();
  const bulkAdd = useChessTournamentStore((s) => s.bulkAddPlayers);

  const [open, setOpen] = useState(false);
  const [raw, setRaw] = useState('');

  const count = useMemo(() => parseNames(raw).length, [raw]);

  const onAdd = () => {
    const names = parseNames(raw);
    if (names.length === 0) return;
    bulkAdd(names);
    setRaw('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{t('BULK_PASTE')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('BULK_PASTE_TITLE')}</DialogTitle>
          <DialogDescription>{t('BULK_PASTE_HELP')}</DialogDescription>
        </DialogHeader>

        <Textarea
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          rows={8}
          placeholder={t('BULK_PASTE_PLACEHOLDER')}
        />

        <div className="text-sm text-muted-foreground">{t('N_PLAYERS_TO_ADD', { count })}</div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('CANCEL')}
          </Button>
          <Button onClick={onAdd} disabled={count === 0}>
            {t('ADD')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
