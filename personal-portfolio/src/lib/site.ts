export const base = import.meta.env.BASE_URL.replace(/\/$/, '') + '/';
export const path = (route = '') => base + route.replace(/^\//, '');
// The static GitHub mirror cannot serve private diary sessions.
export const diaryPath = base === '/' ? '/diary/' : 'https://frankenendu.link/diary/';
export const site = {
  name: 'Frank Enendu',
  title: 'Frank Enendu — AI Engineer & Builder',
  description: 'AI engineering, embedded client delivery, and the products I’m building. Frank Enendu, AI Engineer R&D at Bally’s Interactive, based in Manchester.',
  email: 'enendufrankc@gmail.com',
  github: 'https://github.com/enendufrankc',
  linkedin: 'https://www.linkedin.com/in/enendu-frank-chinedu/',
};

export const canonicalPath = (pathname: string) => "/" + pathname.slice(base.length).replace(/^\//, "");
