import jwtTypes from 'hono/utils/jwt/types';

import { Role } from './constants';

type JWTPayload = jwtTypes.JWTPayload & {
  sub: number;
  role: Role;
};
