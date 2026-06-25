export type Role = 'client' | 'coach' | 'admin';

export type Goal =
  | 'fat_loss'
  | 'muscle_gain'
  | 'strength'
  | 'bodybuilding'
  | 'calisthenics'
  | 'general_fitness';

export type Rank =
  | 'Bronze'
  | 'Silver'
  | 'Gold'
  | 'Platinum'
  | 'Diamond'
  | 'Crew'
  | 'Ace 1'
  | 'Ace 2'
  | 'Ace 3'
  | 'Ace 4'
  | 'Ace 5'
  | 'Ace 6'
  | 'Ace 7'
  | 'Ace 8'
  | 'Ace 9'
  | 'Ace 10'
  | 'Conquer';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  goal?: Goal;
  avatarUrl?: string;
  createdAt: number;
}

export interface AvailabilitySlot {
  day: string;
  start: string;
  end: string;
}

export interface Coach {
  userId: string;
  name: string;
  bio: string;
  experience: number;
  specializations: Goal[];
  price: number;
  rating: number;
  reviewCount: number;
  availability: AvailabilitySlot[];
  verified: boolean;
}

export interface CoachRow {
  user_id: string;
  name: string;
  bio: string;
  experience: number;
  specializations: Goal[];
  price: number;
  rating: number;
  review_count: number;
  availability: AvailabilitySlot[];
  verified: boolean;
}

export function coachFromRow(row: CoachRow): Coach {
  return {
    userId: row.user_id,
    name: row.name,
    bio: row.bio,
    experience: row.experience,
    specializations: row.specializations,
    price: row.price,
    rating: row.rating,
    reviewCount: row.review_count,
    availability: row.availability,
    verified: row.verified,
  };
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentStatus = 'unpaid' | 'paid';

export interface Booking {
  id: string;
  clientId: string;
  coachId: string;
  date: string;
  time: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: number;
}

export interface BookingRow {
  id: string;
  client_id: string;
  coach_id: string;
  date: string;
  time: string;
  status: BookingStatus;
  payment_status: PaymentStatus;
  created_at: number;
}

export function bookingFromRow(row: BookingRow): Booking {
  return {
    id: row.id,
    clientId: row.client_id,
    coachId: row.coach_id,
    date: row.date,
    time: row.time,
    status: row.status,
    paymentStatus: row.payment_status ?? 'unpaid',
    createdAt: row.created_at,
  };
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: number;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  timestamp: number;
}

export function messageFromRow(row: MessageRow): Message {
  return {
    id: row.id,
    senderId: row.sender_id,
    receiverId: row.receiver_id,
    message: row.message,
    timestamp: row.timestamp,
  };
}

export interface DailyTask {
  key: 'workout' | 'steps' | 'water';
  label: string;
  completed: boolean;
}

export interface Missions {
  userId: string;
  xp: number;
  level: Rank;
  completedTasks: DailyTask[];
  stageProgress: Record<string, boolean[]>;
}

export interface MissionsRow {
  user_id: string;
  xp: number;
  level: Rank;
  completed_tasks: DailyTask[];
  stage_progress: Record<string, boolean[]> | null;
}

export function missionsFromRow(row: MissionsRow): Missions {
  return {
    userId: row.user_id,
    xp: row.xp,
    level: row.level,
    completedTasks: row.completed_tasks,
    stageProgress: row.stage_progress ?? {},
  };
}

export function missionsToRow(m: Missions): MissionsRow {
  return {
    user_id: m.userId,
    xp: m.xp,
    level: m.level,
    completed_tasks: m.completedTasks,
    stage_progress: m.stageProgress,
  };
}

export const RANK_THRESHOLDS: { rank: Rank; min: number; max: number }[] = [
  { rank: 'Bronze', min: 0, max: 300 },
  { rank: 'Silver', min: 300, max: 600 },
  { rank: 'Gold', min: 600, max: 1200 },
  { rank: 'Platinum', min: 1200, max: 2000 },
  { rank: 'Diamond', min: 2000, max: 3500 },
  { rank: 'Crew', min: 3500, max: 5000 },
  { rank: 'Ace 1', min: 5000, max: 6000 },
  { rank: 'Ace 2', min: 6000, max: 7000 },
  { rank: 'Ace 3', min: 7000, max: 8000 },
  { rank: 'Ace 4', min: 8000, max: 9000 },
  { rank: 'Ace 5', min: 9000, max: 10000 },
  { rank: 'Ace 6', min: 10000, max: 11000 },
  { rank: 'Ace 7', min: 11000, max: 12000 },
  { rank: 'Ace 8', min: 12000, max: 13000 },
  { rank: 'Ace 9', min: 13000, max: 14000 },
  { rank: 'Ace 10', min: 14000, max: 15000 },
  { rank: 'Conquer', min: 15000, max: 999999 },
];

export function rankForXp(xp: number): { rank: Rank; min: number; max: number } {
  return RANK_THRESHOLDS.find((r) => xp >= r.min && xp < r.max) ?? RANK_THRESHOLDS[RANK_THRESHOLDS.length - 1];
}

const RANK_COLORS: Record<Rank, string> = {
  Bronze: '#CD7F32',
  Silver: '#C0C0C0',
  Gold: '#FFD700',
  Platinum: '#A8C5D6',
  Diamond: '#B9F2FF',
  Crew: '#65A30D',
  'Ace 1': '#F97316',
  'Ace 2': '#F97316',
  'Ace 3': '#F97316',
  'Ace 4': '#F97316',
  'Ace 5': '#F97316',
  'Ace 6': '#EF4444',
  'Ace 7': '#EF4444',
  'Ace 8': '#EF4444',
  'Ace 9': '#EF4444',
  'Ace 10': '#EF4444',
  Conquer: '#FACC15',
};

export function rankColor(rank: Rank): string {
  return RANK_COLORS[rank] ?? '#65A30D';
}

export type ProductCategory = 'protein' | 'supplements' | 'equipment' | 'apparel' | 'accessories';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  imageUrl?: string;
  verified: boolean;
  stock: number;
  sellerId?: string;
}

export interface ProductRow {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  image_url: string | null;
  verified: boolean;
  stock: number;
  seller_id?: string | null;
}

export function productFromRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: row.price,
    description: row.description,
    imageUrl: row.image_url ?? undefined,
    verified: row.verified,
    stock: row.stock,
    sellerId: row.seller_id ?? undefined,
  };
}

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  coverImageUrl?: string;
}

export interface CommunityGroupRow {
  id: string;
  name: string;
  description: string;
  member_count: number;
  cover_image_url: string | null;
}

export function communityGroupFromRow(row: CommunityGroupRow): CommunityGroup {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    memberCount: row.member_count,
    coverImageUrl: row.cover_image_url ?? undefined,
  };
}

export interface CommunityPost {
  id: string;
  groupId: string;
  authorId: string;
  authorName?: string;
  content: string;
  createdAt: number;
  likeCount: number;
  commentCount: number;
}

export interface CommunityPostRow {
  id: string;
  group_id: string;
  author_id: string;
  content: string;
  created_at: number;
}

export function communityPostFromRow(row: CommunityPostRow): CommunityPost {
  return {
    id: row.id,
    groupId: row.group_id,
    authorId: row.author_id,
    content: row.content,
    createdAt: row.created_at,
    likeCount: 0,
    commentCount: 0,
  };
}

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName?: string;
  content: string;
  createdAt: number;
}

export interface CommunityCommentRow {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: number;
}

export function communityCommentFromRow(row: CommunityCommentRow): CommunityComment {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    content: row.content,
    createdAt: row.created_at,
  };
}

export type AnnouncementCategory = 'news' | 'feature' | 'tournament' | 'verification' | 'maintenance';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  createdAt: number;
}

export interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  created_at: number;
}

export function announcementFromRow(row: AnnouncementRow): Announcement {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    category: row.category,
    createdAt: row.created_at,
  };
}

export interface Achievement {
  id: string;
  userId: string;
  key: string;
  label: string;
  earnedAt: number;
}

export interface AchievementRow {
  id: string;
  user_id: string;
  key: string;
  label: string;
  earned_at: number;
}

export function achievementFromRow(row: AchievementRow): Achievement {
  return { id: row.id, userId: row.user_id, key: row.key, label: row.label, earnedAt: row.earned_at };
}

export interface ExerciseVideo {
  id: string;
  uploaderId: string;
  title: string;
  exerciseKey?: string;
  videoUrl: string;
  createdAt: string;
}

export interface ExerciseVideoRow {
  id: string;
  uploader_id: string;
  title: string;
  exercise_key: string | null;
  video_url: string;
  created_at: string;
}

export function exerciseVideoFromRow(row: ExerciseVideoRow): ExerciseVideo {
  return {
    id: row.id,
    uploaderId: row.uploader_id,
    title: row.title,
    exerciseKey: row.exercise_key ?? undefined,
    videoUrl: row.video_url,
    createdAt: row.created_at,
  };
}

export interface CoachReview {
  id: string;
  coachId: string;
  clientId: string;
  bookingId: string;
  rating: number;
  comment: string;
  createdAt: number;
}

export interface CoachReviewRow {
  id: string;
  coach_id: string;
  client_id: string;
  booking_id: string;
  rating: number;
  comment: string;
  created_at: number;
}

export function coachReviewFromRow(row: CoachReviewRow): CoachReview {
  return {
    id: row.id,
    coachId: row.coach_id,
    clientId: row.client_id,
    bookingId: row.booking_id,
    rating: row.rating,
    comment: row.comment,
    createdAt: row.created_at,
  };
}
