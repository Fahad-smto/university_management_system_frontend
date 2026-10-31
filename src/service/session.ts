import 'server-only';
import { cache } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/lib/types';

// One /users/me call per request, no matter how many components ask for it
export const getMe = cache(async () => api<User>('/users/me'));
