# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - button "English" [ref=e4]:
      - img
      - generic [ref=e5]: English
    - generic [ref=e7]:
      - generic [ref=e8]:
        - img [ref=e9]
        - generic [ref=e13]: EstateHub
      - generic [ref=e14]:
        - generic [ref=e15]:
          - generic [ref=e16]: Welcome Back
          - generic [ref=e17]: Sign in to manage your properties and maintenance
        - generic [ref=e19]:
          - generic [ref=e20]:
            - generic [ref=e21]:
              - generic [ref=e22]: Email
              - textbox "Email" [ref=e23]:
                - /placeholder: your@email.com
            - generic [ref=e24]:
              - generic [ref=e25]: Password
              - textbox "Password" [ref=e26]
            - button "Sign In" [ref=e27]
          - generic [ref=e28]:
            - text: Don't have an account?
            - link "Sign Up" [ref=e29] [cursor=pointer]:
              - /url: /auth/sign-up
  - button "Open Next.js Dev Tools" [ref=e35] [cursor=pointer]:
    - img [ref=e36]
  - alert [ref=e39]
```