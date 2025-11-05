# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - generic [ref=e12]:
    - button [ref=e14]:
      - img
    - generic [ref=e16]:
      - generic [ref=e17]:
        - img [ref=e18]
        - generic [ref=e22]: EstateHub
      - generic [ref=e23]:
        - generic [ref=e24]:
          - generic [ref=e25]: Welcome Back
          - generic [ref=e26]: Sign in to manage your properties and maintenance
        - generic [ref=e28]:
          - generic [ref=e29]:
            - generic [ref=e30]:
              - generic [ref=e31]: Email
              - textbox "Email" [ref=e32]:
                - /placeholder: your@email.com
            - generic [ref=e33]:
              - generic [ref=e34]: Password
              - textbox "Password" [ref=e35]
            - button "Sign In" [ref=e36]
          - generic [ref=e37]:
            - text: Don't have an account?
            - link "Sign Up" [ref=e38] [cursor=pointer]:
              - /url: /auth/sign-up
```