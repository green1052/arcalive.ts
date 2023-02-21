# arcalive.ts

#### 해당 프로젝트를 사용함으로 인해 발생하는 모든 불이익은 사용자의 책임입니다.

[Node.js](https://nodejs.org)용 [arca.live](https://arca.live) 비공식 API

## 사용법

몰?루

## 예제 

1. 로그인 후 a 채널 b 카테고리에 새 글 작성 후 로그아웃

```typescript
import { Arcalive } from "./arcalive";
import LoginUser from "./loginUser";

const user = new LoginUser("nickname", "password");

const arcalive = new Arcalive(user);
await arcalive.login();

const channel = arcalive.channel("a");

await channel.article.write("title", "content");

await arcalive.logout();

```

2. 익명 상태로 a 채널 정보 확인

```typescript
import Anonymous from "./anonymous";

const user = new Anonymous("nickname", "password");

const arcalive = new Arcalive(user);

// WIP

const channel = arcalive.channel("a");

await channel.article.write("title", "content");
```
