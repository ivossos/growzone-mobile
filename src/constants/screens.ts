import ProfileIcon from "@/assets/icons/profile.svg";
import CalenderIcon from "@/assets/icons/calender.svg";
import PadlockIcon from "@/assets/icons/padlock.svg";
import SettingsIcon from "@/assets/icons/settings.svg";
import FileIcon from "@/assets/icons/file.svg";
import SecurityIcon from "@/assets/icons/security.svg";
import CloseIcon from "@/assets/icons/close.svg";

export const screens = {
  'edit-profile': {
    title: 'Dados gerais',
    description: 'Gerencie e atualize suas informações pessoais com facilidade e segurança.',
    Icon: ProfileIcon,
  },
  // {
  //   name: 'Eventos',
  //   Icon: CalenderIcon,
  //   route: ''
  // },
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
  // {
  //   name: 'Encerrar sessão',
  //   Icon: CloseIcon,
  //   route: ''
  // },
}