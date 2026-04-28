type Project = {
  id: number;
  name: string;
  location: string;
  status: "ongoing" | "done";
};

const projects: Project[] = [
  { id: 1, name: "Pembangunan Ruko 3 Lantai", location: "Samarinda", status: "ongoing" },
  { id: 2, name: "Renovasi Kantor Area Timur", location: "Balikpapan", status: "done" }
];

export const projectService = {
  getAll: () => projects
};
