import { ImageSourcePropType } from 'react-native';

import guestList from '../../assets/guests/guests.json';

export type Expression = 'worried' | 'relieved';

export type GuestLook = {
  id: string;
  ageRange: string;
  look: string;
  impression: string;
  expressions: Expression[];
};

export const guests = guestList as GuestLook[];

// React Native는 require 경로가 고정 문자열이어야 해서 이미지를 목록으로 묶어 둔다.
const images: Record<string, Record<Expression, ImageSourcePropType>> = {
  guest_01: { worried: require('../../assets/guests/guest_01_worried.png'), relieved: require('../../assets/guests/guest_01_relieved.png') },
  guest_02: { worried: require('../../assets/guests/guest_02_worried.png'), relieved: require('../../assets/guests/guest_02_relieved.png') },
  guest_03: { worried: require('../../assets/guests/guest_03_worried.png'), relieved: require('../../assets/guests/guest_03_relieved.png') },
  guest_04: { worried: require('../../assets/guests/guest_04_worried.png'), relieved: require('../../assets/guests/guest_04_relieved.png') },
  guest_05: { worried: require('../../assets/guests/guest_05_worried.png'), relieved: require('../../assets/guests/guest_05_relieved.png') },
  guest_06: { worried: require('../../assets/guests/guest_06_worried.png'), relieved: require('../../assets/guests/guest_06_relieved.png') },
  guest_07: { worried: require('../../assets/guests/guest_07_worried.png'), relieved: require('../../assets/guests/guest_07_relieved.png') },
  guest_08: { worried: require('../../assets/guests/guest_08_worried.png'), relieved: require('../../assets/guests/guest_08_relieved.png') },
  guest_09: { worried: require('../../assets/guests/guest_09_worried.png'), relieved: require('../../assets/guests/guest_09_relieved.png') },
  guest_10: { worried: require('../../assets/guests/guest_10_worried.png'), relieved: require('../../assets/guests/guest_10_relieved.png') },
  guest_11: { worried: require('../../assets/guests/guest_11_worried.png'), relieved: require('../../assets/guests/guest_11_relieved.png') },
  guest_12: { worried: require('../../assets/guests/guest_12_worried.png'), relieved: require('../../assets/guests/guest_12_relieved.png') },
};

export function guestImage(id: string, expression: Expression = 'worried') {
  return images[id]?.[expression] ?? images.guest_01.worried;
}

// 제외 목록(내 캐릭터와 같은 그림, 직전에 나온 손님)을 빼고 무작위로 고른다
export function pickGuest(exclude: (string | undefined | null)[] = []): GuestLook {
  const pool = guests.filter((g) => !exclude.includes(g.id));
  const list = pool.length > 0 ? pool : guests;
  return list[Math.floor(Math.random() * list.length)];
}
