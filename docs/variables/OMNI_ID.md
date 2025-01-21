[**@clickup/ent-framework**](../README.md)

***

[@clickup/ent-framework](../globals.md) / OMNI\_ID

# Variable: OMNI\_ID

> `const` **OMNI\_ID**: `"omni"` = `"omni"`

Defined in: [src/ent/VC.ts:30](https://github.com/clickup/ent-framework/blob/master/src/ent/VC.ts#L30)

Temporary "omniscient" VC. Any Ent can be loaded with it, but this VC is
replaced with lower-pri VC as soon as possible. E.g. when some Ent is loaded
with omni VC, its ent.vc is assigned to either this Ent's "owner" VC
(accessible via VC pointing field) or, if not detected, to guest VC.
