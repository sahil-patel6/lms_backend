exports.departmentAggregationHelper = [
  {
    $lookup: {
      from: "semesters",
      localField: "_id",
      foreignField: "department",
      pipeline: [
        {
          $lookup: {
            from: "subjects",
            localField: "_id",
            foreignField: "semester",
            as: "subjects",
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  pic_url:1,
                },
              },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            subjects: 1,
          },
        },
        {
          $sort: { name: 1 },
        },
      ],
      as: "semesters",
    },
  },
  {
    $unset: ["__v", "createdAt", "updatedAt"],
  },
];

exports.semesterAggregationHelper = [
  {
    $lookup: {
      from: "departments",
      localField: "department",
      foreignField: "_id",
      as: "department",
      pipeline: [
        {
          $project: {
            _id: 1,
            name: 1,
          },
        },
      ],
    },
  },
  {
    $unwind: "$department",
  },
  {
    $lookup: {
      from: "subjects",
      localField: "_id",
      foreignField: "semester",
      as: "subjects",
      pipeline: [
        {
          $project: {
            _id: 1,
            name: 1,
            credits: 1,
          },
        },
      ],
    },
  },
  { $unset: ["__v", "createdAt", "updatedAt"] },
];

exports.subjectAggregationHelper = [
  {
    $lookup: {
      from: "semesters",
      localField: "semester",
      foreignField: "_id",
      as: "semester",
      pipeline: [
        {
          // $lookup: {
          //   from: "departments",
          //   localField: "department",
          //   foreignField: "_id",
          //   as: "department",
          //   pipeline: [
          //     {
          //       $project: {
          //         _id: 1,
          //         name: 1,
          //       },
          //     },
          //   ],
          // },
          // $unwind: "$department",
          $project: {
            _id: 1,
            name: 1,
            department: 1,
          },
        },
      ],
    },
  },
  {
    $unwind: "$semester"
  },
  {
    $lookup: {
      from: "resources",
      localField: "_id",
      foreignField: "subject",
      as: "resources",
      pipeline: [
        {
          $unset: ["__v", "createdAt", "updatedAt", "subject"],
        },
      ],
    },
  },
  {
    $lookup: {
      from: "assignments",
      localField: "_id",
      foreignField: "subject",
      as: "assignments",
      pipeline: [
        {
          $unset: ["__v", "createdAt", "updatedAt", "subject"],
        },
      ],
    },
  },
  {
    $lookup: {
      from: "teachers",
      localField: "_id",
      foreignField: "subjects",
      as: "teacher",
      pipeline: [
        {
          $unset: [
            "__v",
            "createdAt",
            "updatedAt",
            "subjects",
            "password",
            "salt",
            "fcm_token",
            "fcs_profile_pic_path"
          ],
        },
      ],
    },
  },
  {
    $unwind: { path: "$teacher", preserveNullAndEmptyArrays: true },
  },
  {
    $unset: ["__v", "createdAt", "updatedAt"],
  },
];
