import {
  AcademicCapIcon,
  BeakerIcon,
  CakeIcon,
  CalculatorIcon,
  CalendarIcon,
  ChartBarIcon,
  ChartBarSquareIcon,
  CheckCircleIcon,
  CircleStackIcon,
  ClockIcon,
  CodeBracketIcon,
  CubeIcon,
  DocumentCheckIcon,
  GiftIcon,
  GlobeEuropeAfricaIcon,
  IdentificationIcon,
  LinkIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassCircleIcon,
  MapIcon,
  MapPinIcon,
  NoSymbolIcon,
  ShoppingCartIcon,
  ShieldCheckIcon,
  SparklesIcon,
  StarIcon,
  Squares2X2Icon,
  SwatchIcon,
  TicketIcon,
  TrophyIcon,
  TruckIcon,
  UserCircleIcon,
  UserIcon,
  UsersIcon,
  WindowIcon,
} from '@heroicons/react/24/outline'

export default function Icon({ icon, className }) {
  switch (icon) {
    case 'AcademicCap':
      return <AcademicCapIcon className={className} aria-hidden="true" />
    case 'Beaker':
      return <BeakerIcon className={className} aria-hidden="true" />
    case 'Cake':
      return <CakeIcon className={className} aria-hidden="true" />
    case 'Calculator':
      return <CalculatorIcon className={className} aria-hidden="true" />
    case 'Calendar':
      return <CalendarIcon className={className} aria-hidden="true" />
    case 'ChartBar':
      return <ChartBarIcon className={className} aria-hidden="true" />
    case 'ChartBarSquare':
      return <ChartBarSquareIcon className={className} aria-hidden="true" />
    case 'CheckCircle':
      return <CheckCircleIcon className={className} aria-hidden="true" />
    case 'CircleStack':
      return <CircleStackIcon className={className} aria-hidden="true" />
    case 'Clock':
      return <ClockIcon className={className} aria-hidden="true" />
    case 'CodeBracket':
      return <CodeBracketIcon className={className} aria-hidden="true" />
    case 'Cube':
      return <CubeIcon className={className} aria-hidden="true" />
    case 'DocumentCheck':
      return <DocumentCheckIcon className={className} aria-hidden="true" />
    case 'Gift':
      return <GiftIcon className={className} aria-hidden="true" />
    case 'GlobeEuropeAfrica':
      return <GlobeEuropeAfricaIcon className={className} aria-hidden="true" />
    case 'Identification':
      return <IdentificationIcon className={className} aria-hidden="true" />
    case 'Link':
      return <LinkIcon className={className} aria-hidden="true" />
    case 'LockClosed':
      return <LockClosedIcon className={className} aria-hidden="true" />
    case 'MagnifyingGlass':
      return <MagnifyingGlassIcon className={className} aria-hidden="true" />
    case 'MagnifyingGlassCircle':
      return <MagnifyingGlassCircleIcon className={className} aria-hidden="true" />
    case 'Map':
      return <MapIcon className={className} aria-hidden="true" />
    case 'MapPin':
      return <MapPinIcon className={className} aria-hidden="true" />
    case 'NoSymbol':
      return <NoSymbolIcon className={className} aria-hidden="true" />
    case 'ShoppingCart':
      return <ShoppingCartIcon className={className} aria-hidden="true" />
    case 'ShieldCheck':
      return <ShieldCheckIcon className={className} aria-hidden="true" />
    case 'Sparkles':
      return <SparklesIcon className={className} aria-hidden="true" />
    case 'Star':
      return <StarIcon className={className} aria-hidden="true" />
    case 'Squares2X2':
      return <Squares2X2Icon className={className} aria-hidden="true" />
    case 'Swatch':
      return <SwatchIcon className={className} aria-hidden="true" />
    case 'Ticket':
      return <TicketIcon className={className} aria-hidden="true" />
    case 'Trophy':
      return <TrophyIcon className={className} aria-hidden="true" />
    case 'Truck':
      return <TruckIcon className={className} aria-hidden="true" />
    case 'User':
      return <UserIcon className={className} aria-hidden="true" />
    case 'UserCircle':
      return <UserCircleIcon className={className} aria-hidden="true" />
    case 'Users':
      return <UsersIcon className={className} aria-hidden="true" />
    case 'Window':
      return <WindowIcon className={className} aria-hidden="true" />
    case 'MapIcon':
      return <MapIcon className={className} aria-hidden="true" />
  }
}
