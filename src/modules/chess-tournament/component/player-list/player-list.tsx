import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui-kit/button';
import { Card } from '@/components/ui-kit/card';
import { Input } from '@/components/ui-kit/input';
import { Label } from '@/components/ui-kit/label';
import { Trash2, Pencil, Check } from 'lucide-react';
import { BulkPasteDialog } from '@/modules/chess-tournament/component/bulk-paste-dialog/bulk-paste-dialog';
import { useChessTournamentStore } from '@/modules/chess-tournament/state/tournament-store';

export const PlayerList = () => {
  const { t } = useTranslation();
  const players = useChessTournamentStore((s) => s.players);
  const addPlayer = useChessTournamentStore((s) => s.addPlayer);
  const updatePlayer = useChessTournamentStore((s) => s.updatePlayer);
  const deletePlayer = useChessTournamentStore((s) => s.deletePlayer);

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const sortedPlayers = useMemo(() => [...players].sort((a, b) => a.seed - b.seed), [players]);

  const onAdd = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    addPlayer(trimmed);
    setNewName('');
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const commitEdit = () => {
    if (!editingId) return;
    const trimmed = editingName.trim();
    if (!trimmed) return;
    updatePlayer(editingId, trimmed);
    setEditingId(null);
    setEditingName('');
  };

  return (
    <div className="grid gap-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-2">
          <Label htmlFor="player-name">{t('ADD_PLAYER')}</Label>
          <div className="flex gap-2">
            <Input
              id="player-name"
              value={newName}
              placeholder={t('PLAYER_NAME_PLACEHOLDER')}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onAdd();
              }}
            />
            <Button onClick={onAdd} disabled={!newName.trim()}>
              {t('ADD')}
            </Button>
          </div>
        </div>

        <BulkPasteDialog />
      </div>

      <div className="grid gap-2">
        {sortedPlayers.length === 0 ? (
          <div className="text-sm text-muted-foreground">{t('NO_PLAYERS')}</div>
        ) : null}

        {sortedPlayers.map((p) => (
          <Card key={p.id} className="flex items-center justify-between gap-2 p-3">
            <div className="flex flex-1 items-center gap-3">
              <div className="w-10 text-sm text-muted-foreground">#{p.seed}</div>

              {editingId === p.id ? (
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') commitEdit();
                    if (e.key === 'Escape') {
                      setEditingId(null);
                      setEditingName('');
                    }
                  }}
                />
              ) : (
                <div className="font-medium">{p.name}</div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {editingId === p.id ? (
                <Button size="icon" variant="outline" onClick={commitEdit} aria-label={t('SAVE')}>
                  <Check className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => startEdit(p.id, p.name)}
                  aria-label={t('EDIT')}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}

              <Button
                size="icon"
                variant="destructive"
                onClick={() => deletePlayer(p.id)}
                aria-label={t('DELETE')}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
