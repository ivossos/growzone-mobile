import ProfileIcon from "@/assets/icons/profile.svg";
import PadlockIcon from "@/assets/icons/padlock.svg";
import SettingsIcon from "@/assets/icons/settings.svg";
import FileIcon from "@/assets/icons/file.svg";
import SecurityIcon from "@/assets/icons/security.svg";
import GrowsyncIcon from "@/assets/icons/sync.svg";


export const screens = {
  'growsync': {
    title: 'Growsync',
    description: 'Se conecte com sua conta no Instagram',
    Icon: GrowsyncIcon,
  },
  'edit-profile': {
    title: 'Dados gerais',
    description: 'Gerencie e atualize suas informações pessoais com facilidade e segurança.',
    Icon: ProfileIcon,
  },
  'security': {
    title: 'Segurança',
    description: 'Proteja sua conta atualizando suas configurações de segurança.',
    Icon: PadlockIcon,
  },
  'preference-center': {
    title: 'Central de preferências',
    Icon: SettingsIcon,
    description: 'Lorem ipsum dolor sit amet consectetur. Lectus condimentum tincidunt sed diam elit dolor.',
  },
  'terms-card': {
    title: 'Termos e condições',
    description: 'Esta Política explica como o Growzone usa suas informações pessoais.',
    Icon: FileIcon
  },
  'privacy-policy': {
    title: 'Política de privacidade',
    Icon: SecurityIcon,
    description: 'Esta Política explica como o Growzone usa suas informações pessoais.',
  },

}