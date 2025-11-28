/**
 * STORAGE HELPERS
 * Utilitaires pour gérer les URLs Firebase Storage
 */

/**
 * Extrait le chemin Storage depuis une URL Firebase complète
 * 
 * Exemples:
 * - Input:  "https://firebasestorage.googleapis.com/.../o/images%2Ffile.jpg?alt=media"
 *   Output: "images/file.jpg"
 * 
 * - Input:  "images/file.jpg"
 *   Output: "images/file.jpg"
 * 
 * - Input:  "/images/file.jpg"
 *   Output: "/images/file.jpg"
 * 
 * @param {string} url - URL complète ou chemin relatif
 * @returns {string} - Chemin relatif Storage
 */
export function extractStoragePath(url) {
  if (!url) return '';
  
  try {
    // Essayer de parser comme URL complète
    const urlObj = new URL(url);
    
    // Si c'est Firebase Storage, extraire le chemin
    if (urlObj.hostname.includes('firebasestorage.googleapis.com')) {
      const match = urlObj.pathname.match(/\/o\/(.+)$/);
      if (match) {
        return decodeURIComponent(match[1]);
      }
    }
    
    // Si autre URL, retourner tel quel (edge case)
    return url;
    
  } catch (e) {
    // Pas une URL valide → probablement déjà un chemin relatif
    return url;
  }
}

/**
 * Vérifie si une URL est une URL Firebase Storage complète
 * 
 * @param {string} url - URL à vérifier
 * @returns {boolean}
 */
export function isStorageUrl(url) {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.includes('firebasestorage.googleapis.com');
  } catch {
    return false;
  }
}

/**
 * Convertit un chemin relatif en URL Firebase Storage complète
 * Utile pour afficher les images dans l'admin
 * 
 * @param {string} path - Chemin relatif (ex: "images/file.jpg")
 * @param {object} storage - Instance Firebase Storage
 * @returns {Promise<string>} - URL complète
 */
export async function pathToUrl(path, storage) {
  if (!path) return '';
  
  // Si c'est déjà une URL complète, retourner tel quel
  if (isStorageUrl(path)) {
    return path;
  }
  
  try {
    const { ref, getDownloadURL } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js');
    const storageRef = ref(storage, path);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Erreur conversion path → URL:', error);
    return path; // Fallback
  }
}