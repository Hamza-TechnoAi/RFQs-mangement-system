export interface User { _id: string; name: string; email: string; role: "admin" | "member"; isActive?: boolean; }
export interface LoginResponse { token: string; user: User; }
