# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - generic [ref=e12]:
    - button "English" [ref=e14]:
      - img
      - generic [ref=e15]: English
    - generic [ref=e17]:
      - generic [ref=e18]:
        - img [ref=e19]
        - generic [ref=e23]: EstateHub
      - generic [ref=e24]:
        - generic [ref=e25]:
          - generic [ref=e26]: Welcome Back
          - generic [ref=e27]: Sign in to manage your properties and maintenance
        - generic [ref=e29]:
          - generic [ref=e30]:
            - generic [ref=e31]:
              - generic [ref=e32]: Email
              - textbox "Email" [ref=e33]:
                - /placeholder: your@email.com
            - generic [ref=e34]:
              - generic [ref=e35]: Password
              - textbox "Password" [ref=e36]
            - button "Sign In" [ref=e37]
          - generic [ref=e38]:
            - text: Don't have an account?
            - link "Sign Up" [ref=e39] [cursor=pointer]:
              - /url: /auth/sign-up
```