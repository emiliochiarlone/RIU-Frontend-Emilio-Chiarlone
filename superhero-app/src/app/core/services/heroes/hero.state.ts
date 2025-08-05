import { Hero } from "@core/models/hero.model";
import { ErrorCodes } from "@core/utils/errorcodes";

export interface HeroState {
  heroes: Hero[];
  isLoading: boolean;
  errorMessage: string | null;
  errorCode: ErrorCodes | null;
  searchTerm: string;
}
