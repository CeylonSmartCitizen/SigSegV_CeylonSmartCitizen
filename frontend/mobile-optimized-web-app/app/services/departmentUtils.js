// Utility to extract unique departments from services
export function getUniqueDepartments(services) {
  const seen = new Set();
  const departments = [];
  for (const service of services) {
    if (service.department && service.department.name && !seen.has(service.department.name)) {
      seen.add(service.department.name);
      departments.push({
        name: service.department.name,
        id: service.department.id
      });
    }
  }
  return departments;
}
