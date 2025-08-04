import { Hero } from "@core/models/hero.model";

export interface HeroState {
  heroes: Hero[];
  isLoading: boolean;
  error: string | null;
}
