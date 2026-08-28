/**
 * Límites canónicos de los formularios públicos.
 *
 * Espejo de backend-public/internal/model/limits.go: los dos archivos
 * deben moverse juntos. El backend vuelve a validar todo, así que estos
 * números son para dar feedback inmediato, no una barrera de seguridad.
 */
export const LIMITS = {
  companyName: { min: 3, max: 120 },
  email: { max: 150 },
  phone: { min: 7, max: 30 },
  region: { max: 100 },
  services: { max: 10 },
  description: { min: 40, max: 600 },
  rejectionReason: { max: 500 },
} as const
