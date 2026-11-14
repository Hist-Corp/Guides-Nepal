# Permission Matrix

| Feature                | Admin | Content Manager | Regional Head | Customer Support | Host |
|------------------------|:-----:|:---------------:|:-------------:|:----------------:|:----:|
| Dashboard overview     |  ✅   |       ✅        |      ✅       |       ✅         |  ✅  |
| Manage users & roles   |  ✅   |       ❌        |      ❌       |       ❌         |  ❌  |
| Host applications      |  ✅   |       ❌        |      ✅*      |       ❌         |  ❌  |
| Support tickets        |  ✅   |       ❌        |      ❌       |       ✅         |  ❌  |
| View bookings          |  ✅   |       ❌        |      ❌       |       ❌         |  ✅  |
| Manage tours           |  ✅   |       ❌        |      ❌       |       ❌         |  ✅  |
| Earnings               |  ✅   |       ❌        |      ❌       |       ❌         |  ✅  |
| Analytics              |  ✅   |       ❌        |      ❌       |       ❌         |  ❌  |
| System settings        |  ✅   |       ❌        |      ❌       |       ❌         |  ❌  |
| Content management     |  ✅   |       ✅        |      ❌       |       ❌         |  ❌  |
| Profile edit           |  ✅   |       ✅        |      ✅       |       ✅         |  ✅  |
| Suspend/Remove users   |  ✅   |       ❌        |      ❌       |       ❌         |  ❌  |
| Promote/Demote roles   |  ✅   |       ❌        |      ❌       |       ❌         |  ❌  |

Notes:
- Dashboard roles, highest privilege first: Admin > Content Manager > Regional Head >
  Customer Support > Host. Travelers use the public site and have no console.
- Host can only manage their own guides and data.
- Regional Head manages host applications for their assigned region only.
- Content Manager tooling exists under Admin and is accessible to Admins; the Content
  Manager role also has its own dashboard limited to content tools (Pages, Blog, Guides
  Content, Media, SEO).
- Admin can edit, add, remove, suspend users and promote/demote roles across all roles.
- The former Super Admin and Guide roles were removed; Admin now holds the top of the
  hierarchy and implicitly passes every guard.
