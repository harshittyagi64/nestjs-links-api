import { Link } from '../links.service';

export interface PaginatedLinks {
  data: Link[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}