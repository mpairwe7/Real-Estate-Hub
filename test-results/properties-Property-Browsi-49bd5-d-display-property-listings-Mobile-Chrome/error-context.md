# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - button [ref=e4]:
      - img
    - generic [ref=e6]:
      - generic [ref=e7]:
        - img [ref=e8]
        - generic [ref=e12]: EstateHub
      - generic [ref=e13]:
        - generic [ref=e14]:
          - generic [ref=e15]: Welcome Back
          - generic [ref=e16]: Sign in to manage your properties and maintenance
        - generic [ref=e18]:
          - generic [ref=e19]:
            - generic [ref=e20]:
              - generic [ref=e21]: Email
              - textbox "Email" [ref=e22]:
                - /placeholder: your@email.com
            - generic [ref=e23]:
              - generic [ref=e24]: Password
              - textbox "Password" [ref=e25]
            - button "Sign In" [ref=e26]
          - generic [ref=e27]:
            - text: Don't have an account?
            - link "Sign Up" [ref=e28] [cursor=pointer]:
              - /url: /auth/sign-up
  - button "Open Next.js Dev Tools" [ref=e34] [cursor=pointer]:
    - img [ref=e35]
  - alert [ref=e38]
```