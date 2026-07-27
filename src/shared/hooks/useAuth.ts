/**
 * @fileoverview Wrapper de compatibilidad — redirige a useAuthContext.
 * 
 * useAuth era un hook local con estado aislado por componente.
 * Ahora AuthContext es la fuente única de verdad.
 * 
 * Para nuevo código, importar directamente desde '@/context/AuthContext':
 *   import useAuthContext from '@/context/AuthContext';
 * 
 * @deprecated Usar useAuthContext en su lugar
 */
import useAuthContext from '@/context/AuthContext';

const useAuth = () => {
  return useAuthContext();
};

export default useAuth;
