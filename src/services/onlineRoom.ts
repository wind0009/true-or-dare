import { createClient, RealtimeChannel } from '@supabase/supabase-js';

const supabase = createClient(
  'https://xxuuqjkaogkuypmddvdp.supabase.co',
  'sb_publishable_f8I-U8AkFy_VTz2mW857EQ_9ZjSil6p',
);

export type OnlineRoomEvent = {
  type: 'request-state' | 'game-state' | 'spin';
  payload?: any;
};

export type RoomMember = { id: string; name: string };

let activeChannel: RealtimeChannel | null = null;

export const makeRoomCode = () =>
  Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');

export const leaveOnlineRoom = async () => {
  if (activeChannel) await supabase.removeChannel(activeChannel);
  activeChannel = null;
};

export const joinOnlineRoom = async ({
  code,
  member,
  onEvent,
  onPresence,
}: {
  code: string;
  member: RoomMember;
  onEvent: (event: OnlineRoomEvent) => void;
  onPresence: (members: RoomMember[]) => void;
}) => {
  await leaveOnlineRoom();

  const channel = supabase
    .channel(`action-verite:${code}`, { config: { presence: { key: member.id } } })
    .on('broadcast', { event: 'game' }, ({ payload }) => onEvent(payload as OnlineRoomEvent))
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<RoomMember>();
      const members = Object.values(state).flat().map((entry) => ({ id: entry.id, name: entry.name }));
      onPresence(members);
    });

  activeChannel = channel;

  return new Promise<void>((resolve, reject) => {
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track(member);
        resolve();
      }
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') reject(new Error('Connexion à la salle impossible'));
    });
  });
};

export const sendRoomEvent = async (event: OnlineRoomEvent) => {
  if (!activeChannel) return;
  await activeChannel.send({ type: 'broadcast', event: 'game', payload: event });
};
