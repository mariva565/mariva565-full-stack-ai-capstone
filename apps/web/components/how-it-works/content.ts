/* -------------------------------------------------------
   How It Works — page data (v1 parity, Bulgarian)
   ------------------------------------------------------- */

export type TimelineStep = {
  number: string;
  icon: string;
  title: string;
  description: string;
  tags: string[];
  /** "success" variant for the final step */
  variant?: "success";
};

export type GalleryItem = {
  src: string | null;
  alt: string;
  label: string;
};

export const TIMELINE_STEPS: TimelineStep[] = [
  {
    number: "1",
    icon: "journal-plus",
    title: "Създай своя курс",
    description:
      "Започни като създадеш нов курс. Дай му име, описание и избери цвят. Всеки курс е като папка за твоето знание.",
    tags: ["Неограничен брой курсове", "Персонализирани цветове"],
  },
  {
    number: "2",
    icon: "collection",
    title: "Организирай в модули",
    description:
      "Раздели курса на модули - теми, седмици или глави. Така ще знаеш точно къде си и какво следва.",
    tags: ["Drag & drop подредба", "Гъвкава структура"],
  },
  {
    number: "3",
    icon: "cloud-arrow-up",
    title: "Качи материали",
    description:
      "Добави всичко необходимо - лекции, PDF файлове, линкове, бележки. Всичко на едно място, достъпно от всяко устройство.",
    tags: ["PDF, изображения, видео", "Линкове и бележки"],
  },
  {
    number: "trophy",
    icon: "mortarboard",
    title: "Учи организирано!",
    description:
      "Готово! Сега имаш перфектно организирано учебно пространство. Фокусирай се върху ученето, а не върху търсенето на материали.",
    tags: ["Достъп отвсякъде", "Винаги синхронизирано"],
    variant: "success",
  },
];

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    src: "/assets/how-it-works/Dashboard_v2_screenshot.png",
    alt: "Dashboard screenshot",
    label: "Табло с курсове",
  },
  {
    src: "/assets/how-it-works/Courses_v2_Screenshot.png",
    alt: "Modules screenshot",
    label: "Модули и структура",
  },
  {
    src: "/assets/how-it-works/Materials_v2_Screenshot.png",
    alt: "Materials screenshot",
    label: "Учебни материали",
  },
  {
    src: "/assets/how-it-works/Profile_v2_Screenshot.png",
    alt: "Profile screenshot",
    label: "Личен профил",
  },
];
