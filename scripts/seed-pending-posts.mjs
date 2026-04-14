import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '../apps/web/.env') });

const sql = neon(process.env.DATABASE_URL);

const posts = [
  { author_id: 4,  title: 'Как да разбера async/await накратко?',          content: 'Опитвам се да разбера как работи async/await в JavaScript. Четох документацията, но ми е трудно. Някой може ли да обясни с прост пример?',                                                                    post_type: 'question'   },
  { author_id: 9,  title: 'Полезни ресурси за TypeScript',                  content: 'Събрах няколко безплатни ресурса: Official TypeScript docs, Total TypeScript от Matt Pocock, TypeScript Deep Dive. Препоръчвам ги горещо!',                                                                        post_type: 'resource'   },
  { author_id: 3,  title: 'Съвети за структура на capstone проект?',        content: 'Работя по capstone проект и се чудя как да структурирам кода. Ползвате ли monorepo? Кои инструменти препоръчвате за state management?',                                                                         post_type: 'discussion' },
  { author_id: 10, title: 'Грешка при деплой на Vercel — MODULE_NOT_FOUND', content: 'Получавам грешка при деплой: MODULE_NOT_FOUND. Пробвах всичко от Stack Overflow, но не помага. Някой срещал ли е подобен проблем с Next.js?',                                                                   post_type: 'question'   },
];

for (const p of posts) {
  const r = await sql`INSERT INTO posts (author_id, title, content, post_type, status)
    VALUES (${p.author_id}, ${p.title}, ${p.content}, ${p.post_type}, 'pending')
    RETURNING id, title, status`;
  console.log('✓', r[0].id, r[0].status, '-', r[0].title);
}

console.log('\nDone — 4 pending posts inserted.');
