# arcalive.ts

#### 해당 프로젝트를 사용함으로 인해 발생하는 모든 불이익은 사용자의 책임입니다.

[arca.live](https://arca.live) 비공식 API

## 사용법

몰?루

## 예제 

1. 로그인 후 a 채널 b 카테고리에 새 글 작성 후 로그아웃

```typescript
import {Arcalive} from "arcalive.ts";
import {AnonymousUser} from "arcalive.ts";
import {LoginUser} from "arcalive.ts";

const userInfo = new LoginUser("username", "password");
const arcalive = new Arcalive(userInfo);

await arcalive.Auth.Login();

await arcalive.Article.Write("a", "b", "제목 테스트", "본문 테스트");

await arcalive.Auth.Logout();
```

2. 익명 상태로 a 채널 정보 확인

```typescript
import {Arcalive} from "arcalive.ts";
import {AnonymousUser} from "arcalive.ts";
import {User} from "arcalive.ts";

const userInfo = new AnonymousUser("nickname", "password");
const arcalive = new Arcalive(userInfo);

await arcalive.Channel.GetInfo("a");
```
