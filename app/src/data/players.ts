import { ImageSourcePropType } from 'react-native';

// sameAsGuest: 이 캐릭터가 손님 일러스트와 같은 그림이면 그 손님 id. 손님을 뽑을 때 제외한다.
export type Player = { id: string; image: ImageSourcePropType; sameAsGuest?: string };

// TODO(캐릭터 완성 후): assets/players/player_01.png ~ 로 교체하고 mascot도 바꾼다.
// 지금은 손님 일러스트(편해진 표정)를 임시로 쓴다.
export const players: Player[] = [
  { id: 'player_01', image: require('../../assets/guests/guest_01_relieved.png'), sameAsGuest: 'guest_01' },
  { id: 'player_02', image: require('../../assets/guests/guest_06_relieved.png'), sameAsGuest: 'guest_06' },
  { id: 'player_03', image: require('../../assets/guests/guest_08_relieved.png'), sameAsGuest: 'guest_08' },
  { id: 'player_04', image: require('../../assets/guests/guest_12_relieved.png'), sameAsGuest: 'guest_12' },
  { id: 'player_05', image: require('../../assets/guests/guest_03_relieved.png'), sameAsGuest: 'guest_03' },
  { id: 'player_06', image: require('../../assets/guests/guest_07_relieved.png'), sameAsGuest: 'guest_07' },
  { id: 'player_07', image: require('../../assets/guests/guest_10_relieved.png'), sameAsGuest: 'guest_10' },
  { id: 'player_08', image: require('../../assets/guests/guest_11_relieved.png'), sameAsGuest: 'guest_11' },
];

// 캐릭터를 고르기 전 첫 화면 거울에 보이는 대표 캐릭터
export const mascot: ImageSourcePropType = require('../../assets/guests/guest_05_relieved.png');

export function playerImage(id: string | null): ImageSourcePropType {
  return players.find((p) => p.id === id)?.image ?? mascot;
}

// 손님 뽑기에서 빼야 할 손님 id (내 캐릭터와 같은 그림)
export function guestIdOfPlayer(id: string | null): string | undefined {
  return players.find((p) => p.id === id)?.sameAsGuest;
}
