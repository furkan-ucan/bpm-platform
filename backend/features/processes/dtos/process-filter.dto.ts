export type ProcessFilterDTO = {
  status?: "active" | "inactive" | "archived";
  search?: string;
  page?: number;
  limit?: number;
};
