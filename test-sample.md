```chat
> Alice: Hello, how are you?
>> Bob: I'm good, thanks! How about you?
>>> Alice: Great! I was wondering if you could help me with something.
>>>> Bob: Of course! What do you need?
>>> Alice: I need to understand this new feature.
>> Charlie: Hey everyone, what's going on?
> Alice: Hi Charlie, we're discussing the new feature.
```

このサンプルは以下のような構造になっています：
- Alice (A): "Hello, how are you?" (replyLevel: 0)
- Bob (B): "I'm good, thanks! How about you?" (replyLevel: 1)
- Alice (A): "Great! I was wondering if you could help me with something." (replyLevel: 2)
- Bob (B): "Of course! What do you need?" (replyLevel: 3)
- Alice (A): "I need to understand this new feature." (replyLevel: 2)
- Charlie (C): "Hey everyone, what's going on?" (replyLevel: 1)
- Alice (A): "Hi Charlie, we're discussing the new feature." (replyLevel: 0)
