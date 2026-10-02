import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

const MySwal = withReactContent(Swal)

export const showAlert = (title: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info') => {
  return MySwal.fire({
    title,
    icon,
    confirmButtonColor: '#000',
    confirmButtonText: 'Oldu',
    customClass: {
      popup: 'rounded-3xl',
      confirmButton: 'rounded-xl px-6 font-bold'
    }
  })
}

export const showConfirm = async (title: string, text: string = "") => {
  const result = await MySwal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#000',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Bəli',
    cancelButtonText: 'Xeyr',
    customClass: {
      popup: 'rounded-3xl',
      confirmButton: 'rounded-xl px-6 font-bold',
      cancelButton: 'rounded-xl px-6 font-bold'
    }
  })
  return result.isConfirmed
}
